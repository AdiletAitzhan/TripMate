package kz.sdu.keycloak;

import kz.sdu.config.KeycloakProperties;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.stereotype.Component;

@Component
public class KeycloakAdminFactory {
    private final KeycloakProperties props;

    public KeycloakAdminFactory(KeycloakProperties props) {
        this.props = props;
    }

    /**
     * Uses the built-in admin user (dev) from docker-compose.
     * Realm is "master", client is "admin-cli".
     */
    public Keycloak admin() {
        return KeycloakBuilder.builder()
                .serverUrl(props.baseUrl())
                .realm("master")
                .clientId("admin-cli")
                .grantType(OAuth2Constants.PASSWORD)
                .username(props.adminUsername())
                .password(props.adminPassword())
                .build();
    }
}

