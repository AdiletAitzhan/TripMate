package kz.sdu.dto.common;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaginationDto {

    private int page;
    private int limit;
    private long total;
    private int totalPages;
}
