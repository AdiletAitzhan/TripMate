package kz.sdu.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "tripmate.keycloak")
public record KeycloakProperties(
        String baseUrl,
        String realm,
        String clientId,
        String clientSecret,
        String adminUsername,
        String adminPassword
) {
    public String tokenUrl() {
        return baseUrl + "/realms/" + realm + "/protocol/openid-connect/token";
    }

    public String logoutUrl() {
        return baseUrl + "/realms/" + realm + "/protocol/openid-connect/logout";
    }
}

