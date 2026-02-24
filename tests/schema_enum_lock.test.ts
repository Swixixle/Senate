import fs from "node:fs";
import path from "node:path";

describe("schema enum lock", () => {
  test("event/receipt schemas contain required enums (drift guard)", () => {
    const eventSchemaPath = path.join(process.cwd(), "src", "schema", "event.schema.json");
    const receiptSchemaPath = path.join(process.cwd(), "src", "schema", "receipt.schema.json");

    const eventSchema = JSON.parse(fs.readFileSync(eventSchemaPath, "utf8"));
    const receiptSchema = JSON.parse(fs.readFileSync(receiptSchemaPath, "utf8"));

    const eventTypeEnum = eventSchema.properties.event_type.enum;
    expect(eventTypeEnum).toEqual([
      "vote",
      "bill_sponsorship",
      "donation",
      "statement",
      "press_release",
      "media_appearance",
      "filing",
      "correction",
      "retraction",
      "note",
    ]);

    const sourceKindEnum = eventSchema.properties.source.properties.kind.enum;
    expect(sourceKindEnum).toEqual([
      "congress",
      "senate",
      "fec",
      "court",
      "publisher",
      "press_release",
      "other",
    ]);

    const positionEnum = eventSchema.properties.payload.oneOf[0].properties.position.enum;
    expect(positionEnum).toEqual(["Yea", "Nay", "Present", "Not Voting"]);

    const contentTypeEnum = eventSchema.properties.evidence.properties.content_type.enum;
    expect(contentTypeEnum).toEqual(["text", "html", "pdf", "json"]);

    const artifactTypeEnum = receiptSchema.properties.artifact_type.enum;
    expect(artifactTypeEnum).toEqual(["senator", "event"]);

    const artifactSchemaEnum = receiptSchema.properties.artifact_schema.enum;
    expect(artifactSchemaEnum).toEqual(["halo.senator.v1", "halo.event.v1"]);
  });
});
