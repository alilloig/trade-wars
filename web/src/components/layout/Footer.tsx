export function Footer() {
  return (
    <footer className="mt-auto py-4 px-4 border-t border-gold/30 text-center">
      <p className="text-sm text-gray-400">
        Trade Wars - Built on{' '}
        <a
          href="https://sui.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold hover:text-gold-light transition-colors"
        >
          Sui
        </a>
      </p>
    </footer>
  );
}
