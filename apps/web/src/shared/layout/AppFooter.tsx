export function AppFooter() {
  return (
    <footer className="app-footer -mx-6 border-t border-slate-200 bg-[#FBFBFC] px-6 py-5 text-center text-sm text-slate-500">
      © {new Date().getFullYear()}{" "}
      <strong className="app-footer-brand text-violet-700">HelpSenior</strong>.
      Todos os direitos reservados.
    </footer>
  );
}
