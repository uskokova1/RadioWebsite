import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
    user : {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true},
    displayName: {type: String, default: ''}, //will get later
    bio: {type: String, default: ''}, //user will edit and will be saved later
    avatar: {type: String, default: ''},
    stickers: { //max of three stickers
        type: [String],
        default: [], //change later
        validate: {
            validator: (arr) => arr.length <= 3, //change later and change in jsx
            message: 'Maximum of 3 stickers allowed',
        }
    },
}, { timestamps: true });

const profileModel = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
