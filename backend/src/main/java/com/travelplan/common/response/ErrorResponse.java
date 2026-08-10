package com.travelplan.common.response;

import java.util.List;

/**
 * APIエラーレスポンスの統一フォーマット。
 */
public record ErrorResponse(String code, String message, List<FieldErrorItem> errors) {

    public static ErrorResponse of(String code, String message) {
        return new ErrorResponse(code, message, List.of());
    }

    public static ErrorResponse of(String code, String message, List<FieldErrorItem> errors) {
        return new ErrorResponse(code, message, errors);
    }

    public record FieldErrorItem(String field, String message) {
    }
}
