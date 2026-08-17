package com.travelplan.common.exception;

/**
 * 指定されたIDのリソースが存在しない場合の例外。
 * 特定の機能に依存しない汎用的な形状のため、機能パッケージではなくcommonに置く。
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
