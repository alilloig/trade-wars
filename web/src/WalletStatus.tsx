import { useCurrentAccount } from "@mysten/dapp-kit";
import { Container, Flex, Heading, Text, Box } from "@radix-ui/themes";
import { OverseerObjects } from "./OverseerObjects";

interface WalletStatusProps {
  onSelectObject?: (id: string) => void;
}

export function WalletStatus({ onSelectObject }: WalletStatusProps) {
  const account = useCurrentAccount();

  return (
    <>
      {account ? (
        <Container my="2">
          <OverseerObjects onSelectObject={onSelectObject} />
        </Container>
      ) : (
        <>
          <Box style={{ 
            position: "relative",
            left: "-1rem",
            right: "-1rem", 
            width: "calc(100% + 2rem)",
            margin: 0, 
            padding: 0
          }}>
            <img 
              src="/tradewars.png" 
              alt="Trade Wars Banner" 
              style={{ 
                width: "100%", 
                height: "auto",
                display: "block",
                margin: 0,
                padding: 0
              }} 
            />
          </Box>
          <Container my="4" px="4" style={{fontFamily: 'Orbitron, sans-serif',}}>
            <Heading mb="4" size="6" weight="bold" style={{ color: "#d4af37", fontFamily: 'Orbitron, sans-serif', }}>
              In the vast darkness of the far future, there is only trade
            </Heading>
            
            <Text mb="4" size="3" weight="bold" style={{ lineHeight: "1.6", color: "#e0e0e0",  }}>
              Humanity nearly drove itself to extinction during the Last War. Ironically, it was a war invention—Nova, the ultimate fuel enabling fast interplanetary travel—that allowed the last remnants of humanity to leave the Ruined Earth and begin settling other planets. The Company, creators of Nova, retained a monopoly over it, securing tribute from the flourishing human empires born from interstellar expansion. By strictly controlling Nova production, the Company ensures that no rival empire gains enough power to wage war again. Instead, all empires devote themselves to the only god humanity has consistently worshipped: trade.
            </Text>

            <Heading mt="3" mb="3" size="5" weight="bold" style={{ color: "#d4af37", fontFamily: 'Orbitron, sans-serif', }}>
              Gameplay
            </Heading>
            
            <Text mb="4" size="3" weight="bold" style={{ lineHeight: "1.6", color: "#e0e0e0" }}>
              In <em>Trade Wars</em>, you play as an Overseer—the ruler of an expanding interplanetary empire. Gather resources produced by your planets, invest them to upgrade your infrastructure, and trade with the Company to obtain Nova. Nova enables you to reach and trade with other planets, acquiring the resources your empire needs to thrive.
            </Text>

            <Box mt="5" p="3" style={{ 
              border: "2px solid #d4af37", 
              borderRadius: "8px", 
              backgroundColor: "rgba(212, 175, 55, 0.1)",
              textAlign: "center"
            }}>
              <Heading size="4" weight="bold" style={{ color: "#d4af37" }}>
                Connect your wallet to start playing!
              </Heading>
            </Box>
          </Container>
        </>
      )}
    </>
  );
}
