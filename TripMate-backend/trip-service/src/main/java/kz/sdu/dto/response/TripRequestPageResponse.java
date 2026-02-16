package kz.sdu.dto.response;

import kz.sdu.dto.common.PaginationDto;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@Builder
public class TripRequestPageResponse {

    private List<TripRequestShortResponse> requests;
    private PaginationDto pagination;

    public static TripRequestPageResponse from(Page<TripRequestShortResponse> page) {
        return TripRequestPageResponse.builder()
                .requests(page.getContent())
                .pagination(
                        PaginationDto.builder()
                                .page(page.getNumber() + 1)
                                .limit(page.getSize())
                                .total(page.getTotalElements())
                                .totalPages(page.getTotalPages())
                                .build()
                )
                .build();
    }
}
