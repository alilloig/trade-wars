import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Flex, Heading } from "@radix-ui/themes";
import { useState } from "react";
import { WalletStatus } from "./WalletStatus";
import { ObjectDetails } from "./ObjectDetails";
import { OverseerDetails } from "./OverseerDetails";
import { PlanetView } from "./PlanetView";
import { Footer } from "./Footer";

function App() {
  const [currentPage, setCurrentPage] = useState<
    | { type: 'home' }
    | { type: 'object'; id: string }
    | { type: 'overseer'; id: string }
    | { type: 'planets'; overseerId: string; universeId: string; universeName: string }
  >({ type: 'home' });

  const renderContent = () => {
    switch (currentPage.type) {
      case 'home':
        return (
          <Box
            px="4"
            style={{ 
              height: "100%",
              boxSizing: "border-box"
            }}
          >
            <WalletStatus onSelectObject={(selectedId) => {
              if (selectedId.startsWith('overseer:')) {
                const overseerId = selectedId.replace('overseer:', '');
                setCurrentPage({ type: 'overseer', id: overseerId });
              } else {
                setCurrentPage({ type: 'object', id: selectedId });
              }
            }} />
          </Box>
        );
      case 'object':
        return (
          <Box 
            px="4" 
            style={{ 
              height: "100%",
              boxSizing: "border-box"
            }}
          >
            <ObjectDetails
              objectId={currentPage.id}
              onBack={() => setCurrentPage({ type: 'home' })}
            />
          </Box>
        );
      case 'overseer':
        return (
          <Box 
            px="4" 
            style={{ 
              height: "100%",
              boxSizing: "border-box"
            }}
          >
            <OverseerDetails
              objectId={currentPage.id}
              onBack={() => setCurrentPage({ type: 'home' })}
              onViewPlanets={(universeId: string, universeName: string) => {
                setCurrentPage({ 
                  type: 'planets', 
                  overseerId: currentPage.id, 
                  universeId, 
                  universeName 
                });
              }}
            />
          </Box>
        );
      case 'planets':
        return (
          <Box 
            px="4" 
            style={{ 
              height: "100%",
              boxSizing: "border-box"
            }}
          >
            <PlanetView
              overseerId={currentPage.overseerId}
              universeId={currentPage.universeId}
              universeName={currentPage.universeName}
              onBack={() => setCurrentPage({ type: 'overseer', id: currentPage.overseerId })}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Flex direction="column" style={{ 
      height: "100vh", 
      width: "100vw",
      maxWidth: "100%",
      overflow: "hidden",
      backgroundImage: "url('/background.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      backgroundRepeat: "no-repeat",
      fontFamily: 'Orbitron, sans-serif'
    }}>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        align="center"
        style={{
          backgroundColor: "var(--color-background)",
          opacity: 1,
          flexShrink: 0,
          boxSizing: "border-box"
        }}
      >
        <Box>
          <Heading 
            style={{ 
              cursor: 'pointer',
              fontWeight: '700',
              fontOpticalSizing: 'auto',
              margin: 0,
              lineHeight: 1
            }} 
            onClick={() => setCurrentPage({ type: 'home' })}
          >
            Trade Wars
          </Heading>
        </Box>

        <Box>
          <ConnectButton />
        </Box>
      </Flex>
      
      <Box style={{ flex: 1, overflow: "auto" }}>
        {renderContent()}
      </Box>
      
      <Box style={{ flexShrink: 0 }}>
        <Footer />
      </Box>
    </Flex>
  );
}

export default App;
