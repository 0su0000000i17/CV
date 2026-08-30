create unique index if not exists promo_code_redemptions_order_id_unique
  on public.promo_code_redemptions (order_id)
  where order_id is not null;

create or replace function public.confirm_payment_and_grant(
  p_payment_id uuid,
  p_confirmed_by uuid default null
) returns integer
language plpgsql security definer
set search_path = ''
as $$
declare
  v_payment record;
  v_promo record;
  v_balance integer;
  v_total_redemptions integer;
  v_user_redemptions integer;
begin
  select * into v_payment
  from public.payments
  where id = p_payment_id
  for update;

  if not found then
    raise exception 'PAYMENT_NOT_FOUND';
  end if;

  if v_payment.status = 'succeeded' then
    select balance into v_balance
    from public.user_token_balances
    where user_id = v_payment.user_id;
    return coalesce(v_balance, 0);
  end if;

  if v_payment.status <> 'pending' then
    raise exception 'PAYMENT_NOT_PENDING status=%', v_payment.status;
  end if;

  if v_payment.promo_code_id is not null then
    select * into v_promo
    from public.promo_codes
    where id = v_payment.promo_code_id
    for update;

    if not found or not v_promo.is_active then
      raise exception 'PROMO_NOT_ACTIVE';
    end if;
    if v_promo.starts_at is not null and now() < v_promo.starts_at then
      raise exception 'PROMO_NOT_STARTED';
    end if;
    if v_promo.expires_at is not null and now() > v_promo.expires_at then
      raise exception 'PROMO_EXPIRED';
    end if;

    select count(*) into v_total_redemptions
    from public.promo_code_redemptions
    where promo_code_id = v_promo.id;
    if v_promo.max_redemptions is not null
      and v_total_redemptions >= v_promo.max_redemptions then
      raise exception 'PROMO_LIMIT_REACHED';
    end if;

    select count(*) into v_user_redemptions
    from public.promo_code_redemptions
    where promo_code_id = v_promo.id and user_id = v_payment.user_id;
    if v_user_redemptions >= v_promo.per_user_limit then
      raise exception 'PROMO_USER_LIMIT_REACHED';
    end if;

    insert into public.promo_code_redemptions
      (promo_code_id, user_id, order_id, discount_amount, metadata)
    values
      (v_promo.id, v_payment.user_id, p_payment_id::text,
       v_payment.discount_rub, jsonb_build_object('source', 'payment_confirmation'));
  end if;

  update public.payments
  set status = 'succeeded', confirmed_by = p_confirmed_by,
      confirmed_at = now(), updated_at = now()
  where id = p_payment_id;

  return public.grant_tokens(
    v_payment.user_id, v_payment.tokens, 'purchase', p_payment_id,
    p_confirmed_by, 'Оплата тарифа ' || v_payment.plan_id
  );
end;
$$;

revoke all on function public.confirm_payment_and_grant(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.confirm_payment_and_grant(uuid, uuid)
  to service_role;
