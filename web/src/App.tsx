import { NavigationProvider, useNavigation } from './contexts';
import { Header, Footer, PageContainer } from './components/layout';
import { HomePage, OverseerPage, PlanetViewPage, PlanetDetailsPage } from './pages';

function AppContent() {
  const { currentPage } = useNavigation();

  const renderPage = () => {
    switch (currentPage.type) {
      case 'home':
        return <HomePage />;

      case 'overseer':
        return <OverseerPage overseerId={currentPage.id} />;

      case 'planets':
        return (
          <PlanetViewPage
            overseerId={currentPage.overseerId}
            universeId={currentPage.universeId}
            universeName={currentPage.universeName}
          />
        );

      case 'planet-details':
        return (
          <PlanetDetailsPage
            planetId={currentPage.planetId}
            overseerId={currentPage.overseerId}
            universeId={currentPage.universeId}
            planetData={currentPage.planetData}
          />
        );

      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[url('/background.png')] bg-cover bg-center bg-fixed text-gray-100 font-orbitron">
      <Header />
      <PageContainer>{renderPage()}</PageContainer>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  );
}

export default App;
