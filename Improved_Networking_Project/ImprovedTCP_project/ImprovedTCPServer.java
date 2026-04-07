import java.io.*;
import java.net.*;
import java.util.Enumeration;

public class ImprovedTCPServer {
    public static void main(String[] args) {
        int port = 1234;
        try (ServerSocket serverSocket = new ServerSocket(port)) {
            System.out.println("=== Improved TCP Server ===");
            printLocalIPs();
            System.out.println("Waiting for a connection on port " + port + "...");

            while (true) {
                try (Socket clientSocket = serverSocket.accept();
                     BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
                     PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true)) {

                    String clientIP = clientSocket.getInetAddress().getHostAddress();
                    System.out.println("\n[CONNECTED] Client from: " + clientIP);

                    String message = in.readLine();
                    System.out.println("[RECEIVED] " + clientIP + ": " + message);

                    // Server sending a message back
                    String response = "Hello " + clientIP + "! Server received your message: " + message;
                    out.println(response);
                    System.out.println("[SENT] Response to client.");

                } catch (IOException e) {
                    System.out.println("Error handling client: " + e.getMessage());
                }
            }
        } catch (IOException e) {
            System.out.println("Server error: " + e.getMessage());
        }
    }

    // Helper method to find the IP address of this computer on the network
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
