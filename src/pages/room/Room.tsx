import { useParams } from "react-router";

export default function Room() {
    const { roomId } = useParams();

    return <h1>Room</h1>;
}
