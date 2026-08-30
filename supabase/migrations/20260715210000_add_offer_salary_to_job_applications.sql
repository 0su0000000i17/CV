alter table public.job_applications
  add column offer_salary_rub bigint
  check (offer_salary_rub between 1 and 1000000000);
