export {IAwsConfig, IAzureConfig, IGoogleConfig, IProviderConfig, IStorageProvider} from "./interfaces"

export { AzureStorage } from "./providers/azure/AzureStorage"
export { AwsStorage } from "./providers/aws/AwsStorage"
export { GoogleStorage } from "./providers/google/GoogleStorage"
export { ProviderFactory } from "./providers/ProviderFactory"
