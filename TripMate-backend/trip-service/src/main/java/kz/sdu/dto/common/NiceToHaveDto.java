package kz.sdu.dto.common;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NiceToHaveDto {

    private String similarInterests; // high | medium | low
    private String similarBudget;    // high | medium | low
}
