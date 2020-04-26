declare type NabtoErrorCode = {
    API_ADDRESS_IN_USE: number;
    API_CERT_OPEN_FAIL: number;
    API_CERT_SAVING_FAILURE: number;
    API_ERROR: number;
    API_FAILED_WITH_JSON_MESSAGE: number;
    API_INVALID_ADDRESS: number;
    API_INVALID_SESSION: number;
    API_INVALID_TUNNEL: number;
    API_NOT_INITIALIZED: number;
    API_RPC_DEVICE_OFFLINE: number;
    API_OPEN_CERT_OR_PK_FAILED: number;
    API_SERVER_LOGIN_FAILURE: number;
    API_UNLOCK_KEY_BAD_PASSWORD: number;
    CDV_INVALID_ARG: number;
    CDV_MALFORMED_ERROR_MESSAGE: number;
    CDV_MALFORMED_JSON: number;
    CDV_UNEXPECTED_DATA: number;
    EXC_BASE: number;
    EXC_INV_QUERY_ID: number;
    EXC_NOT_READY: number;
    EXC_NO_ACCESS: number;
    EXC_NO_QUERY_ID: number;
    EXC_OUT_OF_RESOURCES: number;
    EXC_RSP_TOO_LARGE: number;
    EXC_SYSTEM_ERROR: number;
    EXC_TOO_LARGE: number;
    EXC_TOO_SMALL: number;
    P2P_ACCESS_DENIED_BS: number;
    P2P_ACCESS_DENIED_CONNECT: number;
    P2P_BAD_KEY: number;
    P2P_BAD_KEY_ID: number;
    P2P_CERT_CREATION_ERROR: number;
    P2P_CLIENT_CERT_NOT_VERIFIED: number;
    P2P_CONNECTION_PROBLEM: number;
    P2P_DEVICE_BUSY: number;
    P2P_DEVICE_OFFLINE: number;
    P2P_DEVICE_REATTACHING: number;
    P2P_ENCRYPTION_MISMATCH: number;
    P2P_INTERFACE_DEF_INVALID: number;
    P2P_MISSING_PREPARE: number;
    P2P_NO_NETWORK: number;
    P2P_NO_SUCH_REQUEST: number;
    P2P_OTHER: number;
    P2P_PARAM_MISSING: number;
    P2P_PARAM_PARSE_ERROR: number;
    P2P_RESPONSE_DECODE_ERROR: number;
    P2P_RPC_INTERFACE_NOT_SET: number;
    P2P_SELF_SIGNED_NOT_ALLOWED: number;
    P2P_SERVER_CERT_NOT_VERIFIED: number;
    P2P_TIMEOUT: number;
};

declare class NabtoError {
    static Code: NabtoErrorCode;

    code: number;
    message: string;
}
