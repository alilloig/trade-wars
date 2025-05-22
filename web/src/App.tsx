import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Flex, Heading } from "@radix-ui/themes";
import { useState } from "react";
import { WalletStatus } from "./WalletStatus";
import { ObjectDetails } from "./ObjectDetails";
import { Footer } from "./Footer";

function App() {
  const [currentPage, setCurrentPage] = useState<{ type: 'home' } | { type: 'object'; id: string }>({ type: 'home' });

  const renderContent = () => {
    switch (currentPage.type) {
      case 'home':
        return (
          <Box
            px="4"
            style={{ 
              minHeight: "calc(100vh - 120px)", // Full height minus header and footer
              width: "100%"
            }}
          >
            <WalletStatus onSelectObject={(id) => setCurrentPage({ type: 'object', id })} />
          </Box>
        );
      case 'object':
        return (
          <Box 
            px="4" 
            style={{ 
              minHeight: "calc(100vh - 120px)", // Full height minus header and footer
              width: "100%"
            }}
          >
            <ObjectDetails 
              objectId={currentPage.id} 
              onBack={() => setCurrentPage({ type: 'home' })} 
            />
          </Box>
        );
    }
  };

  return (
    <Flex direction="column" style={{ 
      minHeight: "100vh", 
      width: "100%",
      backgroundImage: "url('/background.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      backgroundRepeat: "no-repeat"
    }}>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
          height: "60px", // Fixed header height
          width: "100%",
          backgroundColor: "var(--color-background)",
          opacity: 1
        }}
      >
        <Box>
          <Heading 
            style={{ cursor: 'pointer' }} 
            onClick={() => setCurrentPage({ type: 'home' })}
          >
            Trade Wars
          </Heading>
        </Box>

        <Box>
          <ConnectButton />
        </Box>
      </Flex>
      
      <Box style={{ flex: 1 }}>
        {renderContent()}
      </Box>
      
      <Footer />
    </Flex>
  );
}

export default App;
