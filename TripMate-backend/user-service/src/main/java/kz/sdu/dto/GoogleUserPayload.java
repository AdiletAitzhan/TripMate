package kz.sdu.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GoogleUserPayload {

    // Google unique user id (sub)
    private String googleId;

    // user email
    private String email;

    // full name from Google profile
    private String name;

    // email verified by Google
    private Boolean emailVerified;
}
