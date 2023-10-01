import { ChakraProvider } from "@chakra-ui/react";
import { Buffer } from "buffer";
import FileBrowser from "..";
import { MockDatabase } from "../../../../cypress/support/mock";
import { DatabaseProvider } from "../../../context/database";
import { UserProvider } from "../../../context/user";
import { encrypt } from "../../../utils/crypto";
import type { AuthProperties, User } from "../../../database/model";

const user: User = {
  uid: "uuid-test-user",
};
const userAuth: AuthProperties = {
  bucketId: "app-data",
  fileKey: Buffer.from("1234567-1234567-1234567-1234567-", "utf-8"),
  metadataKey: Buffer.from("7654321-7654321-7654321-7654321-", "utf-8"),
  thumbnailKey: Buffer.from("2222222-2222222-2222222-2222222-", "utf-8"),
  salt: Buffer.from("1234567812345678", "utf-8"),
};

const mountFileBrowser = (database: MockDatabase) => {
  cy.mount(
    <UserProvider initialUser={user} initialUserAuth={userAuth}>
      <DatabaseProvider database={database}>
        <ChakraProvider>
          <FileBrowser />
        </ChakraProvider>
      </DatabaseProvider>
    </UserProvider>
  );
};

describe("<FileBrowser>", () => {
  let database: MockDatabase;

  before(async () => {
    database = new MockDatabase({
      folders: {
        folder1: {
          creationTime: 1234567,
          folderId: null,
          metadata: Buffer.from(
            await encrypt(
              Buffer.from('{"name": "test folder 1"}', "utf-8"),
              userAuth.metadataKey
            )
          ).toString("base64"),
          ownerId: user.uid,
        },
      },
      files: {
        file1: {
          creationTime: 1234567,
          folderId: null,
          hasThumbnail: false,
          metadata: Buffer.from(
            await encrypt(
              Buffer.from(
                `
                {
                  "name": "test file 1",
                  "size": 100,
                  "type": "application/pdf"
                }`,
                "utf-8"
              ),
              userAuth.metadataKey
            )
          ).toString("base64"),
          ownerId: user.uid,
        },
      },
    });
  });

  it("mounts", () => {
    mountFileBrowser(database);
    cy.contains("test folder 1").should("be.visible");
    cy.contains("test file 1").should("be.visible");
  });
});
