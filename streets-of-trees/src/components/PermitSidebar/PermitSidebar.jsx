import React from "react";
import "./PermitSidebar.css";

const PermitSidebar = ({ permit, onClose }) => {

 const formatDate = (dateString) => {
     return dateString ? new Date(dateString).toLocaleDateString("he-IL") : "לא ידוע";
      };
      
  if (!permit) return null;

  const totalTrees = permit.treeNotes?.reduce((sum, tree) => sum + tree.amount, 0) || 0;


  return (
    <div className={`permit-sidebar ${permit ? "open" : ""}`}>
      <button className="close-button" onClick={onClose}>✖ סגור</button>
      <h2>פרטי הרישיון</h2>
      <div className="permit-details">
        <p><strong>מספר רישיון:</strong> {permit.permitNumber}</p>
        <p><strong>סוג הרישיון:</strong> {permit.licenseType}</p>
        <p><strong>תאריכי התחלה וסיום:</strong> {permit.dates.startDate} - {permit.dates.endDate}</p>
        <p><strong>תאריך אחרון להגשת ערר:</strong> {permit.dates.lastDateToObject}</p>
        <p><strong>מבקש הרישיון:</strong> {permit.licenseOwnerName}</p>
        <p><strong>סיבה:</strong> {permit.reasonShort} {permit.reasonDetails ? ' - ' + permit.reasonDetails : ''}</p>
        <p><strong>מיקום:</strong> {permit.address}, גוש {permit.gush}, חלקה {permit.helka}</p>
        <p><strong>שם המאשר:</strong> {permit.licenseApproverName} ({permit.approverTitle})</p>
        <p><strong>מספר העצים:</strong> {totalTrees} </p>
        {permit.treeNotes?.length > 0 ? (
          <ul>
            {permit.treeNotes.map((tree, index) => (
              <li key={index}>
                {tree.amount} × {tree.name}
              </li>
            ))}
          </ul>
        ) : (
          <p>לא נמצאו נתוני עצים.</p>
        )}
      </div>
    </div>
  );
};

export default PermitSidebar;
