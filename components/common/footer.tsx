export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Ege Ayan. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
