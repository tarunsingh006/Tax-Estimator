const taxController = require("./controllers/taxController");

async function testController() {
    const req = { params: { userId: "1" } };
    const res = {
        json: (data) => console.log("SUCCESS:", JSON.stringify(data, null, 2)),
        status: (code) => ({
            json: (data) => console.log("ERROR", code, data)
        })
    };

    await taxController.getCalendarEvents(req, res);
    process.exit(0);
}

testController();
