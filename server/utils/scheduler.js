const cron = require('node-cron');
const User = require('../models/User');

const promoteAllStudents = async () => {
    try {
        console.log('Running Automatic Academic Year Rollover...');

        // Define transitions in specific order to avoid double promotions in a single run if logic was flawed.
        // But here we select by current state, so order matters if we update one group into the next group's criteria.
        // Wait, if I update 'Third Year' to 'Last Year', and then I update 'Last Year' to 'Graduated'...
        // If I do 'Last Year' -> 'Graduated' FIRST, then 'Third Year' -> 'Last Year', the newly promoted 'Last Year' students won't be touched in the first step.
        // So the order MUST be: Last->Graduated, Third->Last, Second->Third, First->Second.

        const transitions = [
            { from: 'Last Year', to: 'Graduated' },
            { from: 'Third Year', to: 'Last Year' },
            { from: 'Second Year', to: 'Third Year' },
            { from: 'First Year', to: 'Second Year' }
        ];

        let totalUpdated = 0;

        for (const transition of transitions) {
            const result = await User.updateMany(
                { academicYear: transition.from, role: 'Student' },
                { $set: { academicYear: transition.to } }
            );
            console.log(`Promoted ${result.modifiedCount} students from ${transition.from} to ${transition.to}`);
            totalUpdated += result.modifiedCount;
        }

        console.log(`Academic Rollover Complete. Total promoted: ${totalUpdated}`);
        return { success: true, count: totalUpdated };
    } catch (error) {
        console.error('Error during academic rollover:', error);
        return { success: false, error: error.message };
    }
};

// Schedule task to run at 00:00 on July 1st
const initScheduler = () => {
    cron.schedule('0 0 1 7 *', () => {
        promoteAllStudents();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
    console.log('Academic Rollover Scheduler Initialized (Runs on July 1st)');
};

module.exports = { initScheduler, promoteAllStudents };
