package kz.sdu.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import kz.sdu.dto.GoogleUserPayload;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GoogleTokenVerifier {

    @Value("${google.client-id}")
    private String clientId;

    public GoogleUserPayload verifyGoogleToken(String idToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            )
                    .setAudience(List.of(clientId))
                    .build();

            GoogleIdToken token = verifier.verify(idToken);

            if (token == null) {
                throw new RuntimeException("Invalid Google id token");
            }

            GoogleIdToken.Payload payload = token.getPayload();

            return new GoogleUserPayload(
                    payload.getSubject(),                // googleId
                    payload.getEmail(),                  // email
                    (String) payload.get("name"),        // name
                    payload.getEmailVerified()           // emailVerified
            );

        } catch (Exception e) {
            throw new RuntimeException("Google token verification failed", e);
        }
    }
}
