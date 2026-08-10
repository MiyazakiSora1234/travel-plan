package com.travelplan.common.exception;

/**
 * 単項目のBean Validationでは表現できない業務ルール違反（例: 終了日が開始日より前）を表す例外。
 * 特定の機能に依存しない汎用的な形状のため、機能パッケージではなくcommonに置く。
 */
public class BusinessRuleException extends RuntimeException {

    private final String field;

    public BusinessRuleException(String field, String message) {
        super(message);
        this.field = field;
    }

    public String getField() {
        return field;
    }
}
