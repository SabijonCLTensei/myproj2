import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.net.InetAddress;
import java.net.Socket;

public class TCPClient {
    public static void main(String[] args) {
        try {
            InetAddress serverAddress = InetAddress.getByName("localhost");
            Socket socket = new Socket(serverAddress, 1234);
            System.out.println("Connected to server!");

            String message = (args.length > 0) ? String.join(" ", args) : "Hello from TCP Client!";

            Writer writer = new OutputStreamWriter(socket.getOutputStream());
            writer.write(message + "\n");
            writer.flush();
            System.out.println("Message sent to server.");

            BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            String response = reader.readLine();
            System.out.println("Server response: " + response);

            reader.close();
            writer.close();
            socket.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}