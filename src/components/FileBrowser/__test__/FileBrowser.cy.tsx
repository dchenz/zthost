import { ChakraProvider } from "@chakra-ui/react";
import { Buffer } from "buffer";
import FileBrowser from "..";
import { MockDatabase } from "../../../../cypress/support/mock";
import { DatabaseProvider } from "../../../context/database";
import { UserProvider } from "../../../context/user";
import type { AuthProperties, User } from "../../../database/model";

const user: User = {
  uid: "12341234-1234-1234-1234-123456789012",
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

describe("FileBrowser: Grid mode", () => {
  let database: MockDatabase;

  before(() => {
    cy.fixture("FileBrowser_database").then((data) => {
      database = new MockDatabase(data);
    });
  });

  it("mounts", () => {
    mountFileBrowser(database);

    cy.contains("Cat Pictures").should("be.visible");
    cy.contains("README.md").should("be.visible");
    cy.contains("github logo").should("be.visible");

    cy.contains("th", "Name").should("not.exist");
    cy.contains("th", "Created").should("not.exist");
    cy.contains("th", "Size").should("not.exist");
  });

  it("can switch views", () => {
    mountFileBrowser(database);

    cy.get('button[aria-label="select-view"]').click();
    cy.get('button[aria-label="list-mode"]').click();

    cy.contains("th", "Name").should("be.visible");
    cy.contains("Cat Pictures").should("be.visible");
    cy.contains("README.md").should("be.visible");
    cy.contains("github logo").should("be.visible");

    cy.contains("th", "Created").should("be.visible");
    cy.contains(/^\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}:\d{2} AM$/).should(
      "be.visible"
    );

    cy.contains("th", "Size").should("be.visible");
    cy.contains("100 B").should("be.visible");
    cy.contains("120.56 KB").should("be.visible");
  });

  it("can change folders", () => {
    mountFileBrowser(database);

    cy.contains('div[role="group"]', "Cat Pictures").click();
    cy.contains('div[role="group"]', "Cat Pictures").should("not.exist");
    cy.contains('div[role="group"]', "cat-with-yarn-ball.png").should(
      "be.visible"
    );

    cy.get('[id="path-viewer"]').contains("Cat Pictures").should("be.visible");
    cy.get('[id="path-viewer"]').contains("My Files").click();

    cy.contains('div[role="group"]', "Cat Pictures").should("be.visible");
    cy.contains('div[role="group"]', "cat-with-yarn-ball.png").should(
      "not.exist"
    );
  });
});

describe("FileBrowser: List mode", () => {
  let database: MockDatabase;

  before(() => {
    cy.fixture("FileBrowser_database").then((data) => {
      database = new MockDatabase(data);
    });
  });

  beforeEach(() => {
    cy.window().then((window) =>
      window.localStorage.setItem("view-mode", '"list"')
    );
  });

  it("mounts", () => {
    mountFileBrowser(database);

    cy.contains("th", "Name").should("be.visible");
    cy.contains("Cat Pictures").should("be.visible");
    cy.contains("README.md").should("be.visible");
    cy.contains("github logo").should("be.visible");

    cy.contains("th", "Created").should("be.visible");
    cy.contains(/^\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}:\d{2} AM$/).should(
      "be.visible"
    );

    cy.contains("th", "Size").should("be.visible");
    cy.contains("100 B").should("be.visible");
    cy.contains("120.56 KB").should("be.visible");
  });

  it("can switch views", () => {
    mountFileBrowser(database);

    cy.get('button[aria-label="select-view"]').click();
    cy.get('button[aria-label="grid-mode"]').click();

    cy.contains("Cat Pictures").should("be.visible");
    cy.contains("README.md").should("be.visible");
    cy.contains("github logo").should("be.visible");

    cy.contains("th", "Name").should("not.exist");
    cy.contains("th", "Created").should("not.exist");
    cy.contains("th", "Size").should("not.exist");
  });

  it("can change folders", () => {
    mountFileBrowser(database);

    cy.contains("tr", "Cat Pictures").click();
    cy.contains("tr", "Cat Pictures").should("not.exist");
    cy.contains("tr", "cat-with-yarn-ball.png").should("be.visible");

    cy.get('[id="path-viewer"]').contains("Cat Pictures").should("be.visible");
    cy.get('[id="path-viewer"]').contains("My Files").click();

    cy.contains("tr", "cat-with-yarn-ball.png").should("not.exist");
    cy.contains("tr", "Cat Pictures").should("be.visible");
  });
});
