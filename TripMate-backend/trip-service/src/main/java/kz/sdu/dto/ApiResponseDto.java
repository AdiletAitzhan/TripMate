package kz.sdu.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ApiResponseDto<T> {

    private boolean success;
    private T data;
    private String message;

    public static <T> ApiResponseDto<T> success(T data) {
        return new ApiResponseDto<>(true, data, null);
    }

    public static <T> ApiResponseDto<T> successMessage(String message) {
        return new ApiResponseDto<>(true, null, message);
    }
}
