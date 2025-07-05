import request from "supertest";
import mongoose from "mongoose";
import app from "../app";
import {credentials} from "./prepare/credentials";
import { announcementCollection } from "../models/announcementModel";

let announcementId: string;

beforeAll(async () => {
    await announcementCollection.deleteMany({});
});

afterAll(async() => {
    await mongoose.disconnect();
});

describe("Announcement tests for school admin", () => {
    it("Adding an announcement", async () => {
        const res = await request(app)
        .post("/v1/announcement")
        .set("Authorization", credentials.schoolAdmin.jwt)
        .send(
            {
                announcementTitle: "Sample announcement",
                announcement: "Here is a sample announcement",
                audienceType: ["parent"]
            }
        );

        console.log(res.body);

        announcementId = res.body.result._id

        expect(res.status).toBe(200);
        expect(res.body.result.announcementTitle).toBe("Sample announcement");
    }, 5000);

    it("Update an announcement", async () => {
        const res = await request(app)
        .put("/v1/announcement/" + announcementId)
        .set("Authorization", credentials.schoolAdmin.jwt)
        .send(
            {
                announcementTitle: "Sample announcement edited",
                announcement: "Here is a sample announcement that has been edited",
                showTill: null,
                audienceType: ["parent"]
            }
        );

        expect(res.status).toBe(200);
        expect(res.body.result.announcementTitle).toBe("Sample announcement edited");
    });

    it("Delete an announcement", async () => {
        const res = await request(app)
        .delete("/v1/announcement/" + announcementId)
        .set("Authorization", credentials.schoolAdmin.jwt);

        expect(res.status).toBe(200);
        expect(res.body.result.announcementTitle).toBe("Sample announcement edited");
    });
});
