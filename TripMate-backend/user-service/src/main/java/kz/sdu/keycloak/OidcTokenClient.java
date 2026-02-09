package kz.sdu.keycloak;

import kz.sdu.config.KeycloakProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Slf4j
@Component
public class OidcTokenClient {
    private final KeycloakProperties props;
    private final RestClient restClient;

    public OidcTokenClient(KeycloakProperties props) {
        this.props = props;
        this.restClient = RestClient.create();
    }

    public Map<String, Object> passwordGrant(String email, String password) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "password");
        form.add("client_id", props.clientId());
        form.add("client_secret", props.clientSecret());
        form.add("username", email);
        form.add("password", password);

        return postForm(props.tokenUrl(), form);
    }

    public Map<String, Object> refreshToken(String refreshToken) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "refresh_token");
        form.add("client_id", props.clientId());
        form.add("client_secret", props.clientSecret());
        form.add("refresh_token", refreshToken);

        return postForm(props.tokenUrl(), form);
    }

    /**
     * Best-effort: works when Keycloak accepts token exchange for configured Google IdP.
     */
    public Map<String, Object> tokenExchangeGoogle(String idToken) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "urn:ietf:params:oauth:grant-type:token-exchange");
        form.add("client_id", props.clientId());
        form.add("client_secret", props.clientSecret());
        form.add("subject_token", idToken);
        form.add("subject_token_type", "urn:ietf:params:oauth:token-type:jwt");
        return postForm(props.tokenUrl(), form);
    }

    public void logout(String refreshToken) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("client_id", props.clientId());
        form.add("client_secret", props.clientSecret());
        form.add("refresh_token", refreshToken);

        restClient.post()
                .uri(props.logoutUrl())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .toBodilessEntity();
    }

    private Map<String, Object> postForm(String url, MultiValueMap<String, String> form) throws HttpClientErrorException {
        return restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(Map.class);
    }
}

