export enum ExceptionCodes {
    ArgumentListTooLong = "E2BIG",
    PermissionDenied = "EACCESS",
    AddressInUse = "EADDRINUSE",
    AddressNotAvailable = "EADDRNOTAVAIL",
    AddressFamilyNotSupported = "EAFNOSUPPORT",
    ResourceUnavailableTryAgain = "EAGAIN",
    ConnectionAlreadyInProgress = "EALREADY",
    BadFileDescriptor = "EBADF",
    BadMessage = "EBADMSG",
    DeviceOrResourceBusy = "EBUSY",
    OperationCancelled = "ECANCELED",
    NoChildProcess = "ECHILD",
    ConnectionAborted = "ECONNABORTED",
    ConnectionRefused = "ECONNREFUSED",
    ConnectionReset = "ECONNRESET",
    ResourceDeadlockWouldOccur = "EDEADLK",
    DestinationAddressRequired = "EDESTADDRREQ",
    ArgumentOutOfDomain = "EDOM",
    FileExists = "EEXIST",
    BadAddress = "EFAULT",
    FileTooLarge = "EFBIG",
    HostUnreachable = "EHOSTUNREACH",
    IdentifierRemoved = "EIDRM",
    IllegalByteSequence = "EILSEQ",
    OperationInProgress = "EINPROGRESS",
    Interrupted = "EINTR",
    InvalidArgument = "EINVAL",
    IoError = "EIO",
    AlreadyConnected = "EISCONN",
    IsADirectory = "EISDIR",
    TooManySymbolicLinkLevels = "ELOOP",
    TooManyFilesOpen = "EMFILE",
    TooManyLinks = "EMLINK",
    MessageSize = "EMSGSIZE",
    FileNameTooLong = "ENAMETOOLONG",
    NetworkDown = "ENETDOWN",
    NetworkReset = "ENETRESET",
    NetworkUnreachable = "ENETUNREACH",
    TooManyFilesOpenInSystem = "ENFILE",
    NoBufferSpace = "ENOBUFS",
    NoMessageAvailable = "ENODATA",
    NoSuchDevice = "ENODEV",
    NoSuchFileOrDirectory = "ENOENT",
    ExecutableFormatError = "ENOEXEC",
    NoLockAvailable = "ENOLCK",
    NoLink = "ENOLINK",
    NotEnoughMemory = "ENOMEM",
    NoMessage = "ENOMSG",
    NoProtocolOption = "ENOPROTOOPT",
    NoSpaceOnDevice = "ENOSPC",
    NoStreamResources = "ENOSR",
    NotAStream = "ENOSTR",
    FunctionNotSupported = "ENOSYS",
    NotConnected = "ENOTCONN",
    NotADirectory = "ENOTDIR",
    DirectoryNotEmpty = "ENOTEMPTY",
    StateNotRecoverable = "ENOTRECOVERABLE",
    NotASocket = "ENOTSOCK",
    NotSupported = "ENOTSUP",
    InappropriateIoControlOperation = "ENOTTY",
    NoSuchDeviceOrAddress = "ENXIO",
    OperationNotSupported = "EOPNOTSUPP",
    Other = "EOTHER",
    ValueTooLarge = "EOVERFLOW",
    OwnerDead = "EOWNERDEAD",
    OperationNotPermitted = "EPERM",
    BrokenPipe = "EPIPE",
    ProtocolError = "EPROTO",
    ProtocolNotSupported = "EPROTONOSUPPORT",
    WrongProtocolType = "EPROTOTYPE",
    ResultOutOfRange = "ERANGE",
    ReadOnlyFileSystem = "EROFS",
    InvalidSeek = "ESPIPE",
    NoSuchProcess = "ESRCH",
    StreamTimeout = "ETIME",
    TimedOut = "ETIMEDOUT",
    TextFileBusy = "ETXTBSY",
    OperationWouldBlock = "EWOULDBLOCK",
    CrossDeviceLink = "EXDEV"
}