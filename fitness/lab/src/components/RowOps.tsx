import { Link } from "react-router-dom";

export function RowOps({
  editTo,
  onDelete,
}: {
  editTo: string;
  onDelete: () => void;
}) {
  return (
    <div className="row-ops">
      <Link className="btn small ghost" to={editTo}>
        Edit
      </Link>
      <button className="btn small ghost" type="button" onClick={onDelete}>
        Delete
      </button>
    </div>
  );
}
