import { httpsCallable } from "firebase/functions";
import { fireBaseFunctions } from "../../firebase";

const functions = fireBaseFunctions;

export default function Solo() {
    const createGameCall = httpsCallable(functions, "createGame");

    createGameCall({ rounds: 2 }).then((result) => console.log(result));

    return <h1>Solo</h1>;
}
