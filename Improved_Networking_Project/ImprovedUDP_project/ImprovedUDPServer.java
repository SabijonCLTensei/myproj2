import java.net.*;
import java.util.Enumeration;

public class ImprovedUDPServer {
    public static void main(String[] args) {
        int port = 1234;
        try (DatagramSocket socket = new DatagramSocket(port)) {
            System.out.println("=== Improved UDP Server ===");
            printLocalIPs();
            System.out.println("Waiting for packets on port " + port + "...");

            byte[] buffer = new byte[2048];

            while (true) {
                // Receive packet from client
                DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
                socket.receive(packet);

                String receivedMsg = new String(packet.getData(), 0, packet.getLength());
                InetAddress clientAddress = packet.getAddress();
                int clientPort = packet.getPort();

                System.out.println("\n[RECEIVED] " + clientAddress.getHostAddress() + ":" + clientPort + " - " + receivedMsg);

                // Send a response back
                String response = "Server received: " + receivedMsg;
                byte[] responseBytes = response.getBytes();
                
                DatagramPacket responsePacket = new DatagramPacket(
                        responseBytes, responseBytes.length, clientAddress, clientPort);
                
                socket.send(responsePacket);
                System.out.println("[SENT] Response to " + clientAddress.getHostAddress());
            }
        } catch (Exception e) {
            System.out.println("UDP Server error: " + e.getMessage());
        }
    }

    private static void printLocalIPs() {
        try {
            System.out.println("To connect from another computer, use one of these IPs:");
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface iface = interfaces.nextElement();
                if (iface.isLoopback() || !iface.isUp()) continue;
                Enumeration<InetAddress> addresses = iface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    InetAddress addr = addresses.nextElement();
                    if (addr instanceof Inet4Address) {
                        System.out.println(" - " + addr.getHostAddress());
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("Could not detect local IPs.");
        }
    }
}
