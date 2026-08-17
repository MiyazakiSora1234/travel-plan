package com.travelplan.common.exception;

import com.travelplan.common.response.ErrorResponse;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * APIのエラーレスポンス形式を統一する。
 * 例外の内部詳細（スタックトレース、SQL文言等）はレスポンスに含めず、ログにのみ出力する。
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<ErrorResponse.FieldErrorItem> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fieldError -> new ErrorResponse.FieldErrorItem(
                        fieldError.getField(),
                        fieldError.getDefaultMessage()))
                .toList();

        ErrorResponse response = ErrorResponse.of(
                "VALIDATION_ERROR",
                "入力内容に誤りがあります",
                errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ErrorResponse> handleBusinessRule(BusinessRuleException ex) {
        ErrorResponse response = ErrorResponse.of(
                "VALIDATION_ERROR",
                "入力内容に誤りがあります",
                List.of(new ErrorResponse.FieldErrorItem(ex.getField(), ex.getMessage())));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadable(HttpMessageNotReadableException ex) {
        ErrorResponse response = ErrorResponse.of(
                "INVALID_REQUEST_BODY",
                "リクエストボディを解釈できませんでした");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * 存在しないpathへのリクエスト（例: typoしたURL）。
     * spring.web.resources.add-mappingsはfalseだが、DispatcherServletは未マッチ時に
     * このExceptionを投げるため、汎用Exceptionハンドラ（500）に落ちないよう明示的に処理する。
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResourceFound(NoResourceFoundException ex) {
        ErrorResponse response = ErrorResponse.of(
                "NOT_FOUND",
                "指定されたリソースが見つかりません");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * 存在するpathに対して未対応のHTTPメソッドでリクエストされた場合（例: GETのみのpathへPOST）。
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        ErrorResponse response = ErrorResponse.of(
                "METHOD_NOT_ALLOWED",
                "このHTTPメソッドはサポートされていません");
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(response);
    }

    /**
     * Service層のチェックをすり抜けてDBのCHECK制約・NOT NULL制約等に違反した場合の保険。
     * SQL文やDB制約名はレスポンスに含めない。
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.warn("Data integrity violation", ex);
        ErrorResponse response = ErrorResponse.of(
                "VALIDATION_ERROR",
                "入力内容に誤りがあります");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex) {
        log.error("Unexpected error occurred", ex);
        ErrorResponse response = ErrorResponse.of(
                "INTERNAL_SERVER_ERROR",
                "サーバーエラーが発生しました");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
