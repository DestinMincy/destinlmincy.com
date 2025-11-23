import {
    CodeCommitClient,
    GetFolderCommand,
    GetFileCommand,
    GetRepositoryCommand,
    Folder,
    File,
} from "@aws-sdk/client-codecommit";

export class CodeCommitService {
    private client: CodeCommitClient;

    constructor() {
        this.client = new CodeCommitClient({
            region: process.env.AWS_REGION || "us-east-1",
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },
        });
    }

    async getRepository(repositoryName: string) {
        const command = new GetRepositoryCommand({ repositoryName });
        const response = await this.client.send(command);
        return response.repositoryMetadata;
    }

    async getFolder(repositoryName: string, folderPath: string = "/") {
        const command = new GetFolderCommand({
            repositoryName,
            folderPath,
        });
        const response = await this.client.send(command);
        return {
            files: response.files || [],
            subFolders: response.subFolders || [],
            symbolicLinks: response.symbolicLinks || [],
            subModules: response.subModules || [],
        };
    }

    async getFile(repositoryName: string, filePath: string) {
        const command = new GetFileCommand({
            repositoryName,
            filePath,
        });
        const response = await this.client.send(command);

        // Convert Uint8Array to string
        const content = response.fileContent
            ? new TextDecoder().decode(response.fileContent)
            : "";

        return {
            ...response,
            content,
        };
    }
}

export const codeCommitService = new CodeCommitService();
