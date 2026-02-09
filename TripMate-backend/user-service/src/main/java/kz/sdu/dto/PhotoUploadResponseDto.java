package kz.sdu.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PhotoUploadResponseDto {
    private boolean success;
    private PhotoUploadDataDto data;
}
