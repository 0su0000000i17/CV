import Link from 'next/link';

export const metadata = {
  title: 'Страница не найдена',
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start py-12">
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        404 / Страница не найдена
      </p>
      <h1 className="text-4xl font-normal tracking-tight text-foreground md:text-5xl">
        Такой страницы нет
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Возможно, ссылка устарела или адрес был введён с ошибкой. Проверьте
        адрес или вернитесь на главную.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80"
      >
        На главную
      </Link>
    </div>
  );
}
