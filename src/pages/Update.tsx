import { useEffect, useState } from "react";
import Loading from "../Loading";
import { httpsCallable } from "firebase/functions";
import { fireBaseFunctions } from "../firebase";

type UpdateResponse = {
    status: number;
    message: string;
};

export default function Update() {
    const functions = fireBaseFunctions;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const updateChampions = httpsCallable(functions, "update");

        updateChampions()
            .then((result) => {
                const response = result.data as UpdateResponse;

                if (response.status === 200) {
                    setLoading(false);
                    setError(null);
                } else {
                    setLoading(false);
                    setError("Not valid response!");
                }
            })
            .catch((err) => {
                setLoading(false);
                setError(err);
                console.error(err);
            });
    }, [setLoading, functions]);

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="updateCt">
            <h1>{error ? "Update failed!" : "Update successful!"}</h1>
            <div className="errorCt">{error && <p>{error}</p>}</div>
        </div>
    );
}
