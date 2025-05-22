import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Flex, Heading } from "@radix-ui/themes";
import { useState } from "react";
import { WalletStatus } from "./WalletStatus";
import { ObjectDetails } from "./ObjectDetails";

function App() {
  const [currentPage, setCurrentPage] = useState<{ type: 'home' } | { type: 'object'; id: string }>({ type: 'home' });

  const renderContent = () => {
    switch (currentPage.type) {
      case 'home':
        return (
          <Box
            pt="2"
            px="4"
            style={{ 
              background: "var(--gray-a2)", 
              minHeight: "calc(100vh - 60px)", // Full height minus header
              width: "100%"
            }}
          >
            <WalletStatus onSelectObject={(id) => setCurrentPage({ type: 'object', id })} />
          </Box>
        );
      case 'object':
        return (
          <Box 
            pt="2" 
            px="4" 
            style={{ 
              background: "var(--gray-a2)", 
              minHeight: "calc(100vh - 60px)", // Full height minus header
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
    <Box style={{ minHeight: "100vh", width: "100%" }}>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
          height: "60px", // Fixed header height
          width: "100%"
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
      
      {renderContent()}
    </Box>
  );
}

export default App;
