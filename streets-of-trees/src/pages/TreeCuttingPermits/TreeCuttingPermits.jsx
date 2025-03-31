import React, { useEffect, useState } from 'react';
import './TreeCuttingPermits.css';
import PermitSidebar from "../../components/PermitSidebar/PermitSidebar";
import { useAuth } from "../../contexts/authContext";
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { IoMdLink } from "react-icons/io";
import { useMediaQuery } from 'react-responsive'; // You'll need to install this package

const TreeCuttingPermits = () => {
  const [licenses, setLicenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [settlement, setSettlement] = useState('');
  const [reason, setReason] = useState('');
  const [licenseType, setLicenseType] = useState('');

  const [selectedPermit, setSelectedPermit] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // Add this to detect mobile screens
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isVerySmallScreen = useMediaQuery({ maxWidth: 480 });

  const {currentUser} = useAuth();

  const settlementOptions = [
    "רחובות", "גבעתיים", "ראשון לציון", "נתניה", "אשדוד", "פתח תקווה"
  ];

  const reasonOptions = [
    "בטיחות", "בניה", "מחלת עץ", "עץ מת", "הפרעה לתשתיות", "אחר"
  ];

  const licenseTypeOptions = [
    "כריתה", "העתקה"
  ];

  // Fetch data from the API - unchanged
  useEffect(() => {
    const fetchLicenses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let apiUrl = `https://tree-permit-api-87iy9v0x.ew.gateway.dev/tree-permits?page=${currentPage}&pageSize=20&sortBy=licenseDate`;

        if (settlement) apiUrl += `&settlementName=${settlement}`;
        if (reason) apiUrl += `&reason=${reason}`;
        if (licenseType) apiUrl += `&licenseType=${licenseType}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch licenses');
        }
        const data = await response.json();

        setLicenses(data.data);
        setTotalPages(data.metadata.totalPages);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLicenses();
  }, [currentPage, settlement, reason, licenseType]);

  const handleRowClick = (permit) => {
    setSelectedPermit(permit);
  };

  const handleCloseSidebar = () => {
    setSelectedPermit(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top on page change for mobile
      if (isMobile) {
        window.scrollTo(0, 0);
      }
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [settlement, reason, licenseType]);

  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  // Helper to parse Hebrew (DD/MM/YYYY) or ISO (YYYY-MM-DD) date and return Date object
  const parseDateSmart = (dateStr) => {
    if (!dateStr) return new Date();
    if (dateStr.includes('/')) {
      // DD/MM/YYYY case
      const [day, month, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day); // Month is 0-based
    } else {
      // ISO format (YYYY-MM-DD)
      return new Date(dateStr);
    }
  };

  // Calculate and render deadline cell (with color depending on status)
  const getDeadlineClass = (dateStr) => {
    if (!dateStr) return '';
  
    const deadlineDate = parseDateSmart(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    return deadlineDate >= today ? 'future-cell' : 'expired-cell';
  };
  
  

  // For mobile view, return the cell content without the td wrapper
  const getDeadlineDateValue = (licenseDateStr) => {
    if (!licenseDateStr) return "-";

    const licenseDate = parseDateSmart(licenseDateStr);
    licenseDate.setDate(licenseDate.getDate() + 14); // Add 14 days

    // Format to DD/MM/YYYY
    const day = String(licenseDate.getDate()).padStart(2, '0');
    const month = String(licenseDate.getMonth() + 1).padStart(2, '0');
    const year = licenseDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    // Compare with today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize time for accurate comparison

    if (licenseDate >= today) {
      // Future date (still valid)
      return { value: formattedDate, className: "future-cell" };
    } else {
      // Expired date
      return { value: formattedDate, className: "expired-cell" };
    }
  };

  const renderSortArrow = (columnName) => {
    if (sortConfig.key !== columnName) return null;
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };
  
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedLicenses = React.useMemo(() => {
    let sortableLicenses = [...licenses];
    if (sortConfig.key !== null) {
      sortableLicenses.sort((a, b) => {
        let aValue = a;
        let bValue = b;

        // Handle nested properties like 'dates.licenseDate'
        if (sortConfig.key.includes('.')) {
          const keys = sortConfig.key.split('.');
          aValue = keys.reduce((acc, key) => acc?.[key], a);
          bValue = keys.reduce((acc, key) => acc?.[key], b);
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        // Handle date parsing if key is 'dates.licenseDate'
        if (sortConfig.key === 'dates.licenseDate') {
          aValue = parseDateSmart(aValue);
          bValue = parseDateSmart(bValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableLicenses;
  }, [licenses, sortConfig]);

  // Render loading, error, or the table
  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>שגיאה: {error}</div>;

  // Render card view for very small screens
  const renderMobileCards = () => {
    return (
      <div className="mobile-friendly-table">
        {sortedLicenses.map((license) => (
          <div 
            key={license.id} 
            className="permit-card" 
            onClick={() => handleRowClick(license)}
          >
            <div className="permit-header">
              <span className="permit-number">רשיון {license.permitNumber}</span>
              <span>{license.licenseType}</span>
            </div>
            
            <div className="permit-row">
              <span className="label">כתובת:</span>
              <span>{license.address} {license.houseNumber}</span>
            </div>
            
            <div className="permit-row">
              <span className="label">עיר:</span>
              <span>{license.settlement}</span>
            </div>
            
            <div className="permit-row">
              <span className="label">סיבה:</span>
              <span>{license.reasonShort}</span>
            </div>
            
            <div className="permit-row">
              <span className="label">תאריך פרסום:</span>
              <span>{license.dates.licenseDate}</span>
            </div>
            
            <div className="permit-row">
              <span className="label">תאריך אחרון לערר:</span>
              <span className={getDeadlineDateValue(license.dates.licenseDate).className}>
                {getDeadlineDateValue(license.dates.licenseDate).value}
              </span>
            </div>
            
            <div className="permit-row">
              <span className="label">לינק:</span>
              <a href={license.resourceUrl} target="_blank" rel="noopener noreferrer" className='license-link'>
                <IoMdLink size={18} color="blue" />
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    
    <div className="tree-cutting-permits">
      
      {currentUser?.displayName && ( 
        <p>שלום {currentUser.displayName}, התחברת בהצלחה</p>
      )}
      <h1>רישיונות כריתה</h1>
      <div className="notice-box">
  <p><span role="img" aria-label="notice">🔎</span> <strong>שימו לב:</strong></p>
  <p>
    המידע המוצג בעמוד זה מבוסס על פרסומים רשמיים של פקידי היערות ומשרד החקלאות. כל רישיון כולל פרטים על מספר הרישיון, סוג הבקשה, העיר, הכתובת, סיבת הכריתה ותאריך הפרסום.
  </p>
  <p>
    אם ברצונכם לבדוק אפשרות להגיש השגה (ערר) על הרישיון, או להבין לעומק מה המשמעות של כל שלב בתהליך – הכנו עבורכם מדריך מפורט:
  </p>
  <p>
    📄 <a className="appeal-guide-link" href="https://drive.google.com/file/d/1hwhK16zMaZ3sR602EpjUaQBAVZh7_ipx/view" target="_blank" rel="noopener noreferrer">
      לחצו כאן למדריך המלא להגשת ערר על רישיון כריתה
    </a>
  </p>
  <p>
    ניתן להגיש ערר 14 ימים מפרסום רישיון הכריתה ובטרם הרישיון נכנס לתוקף. אנחנו ממליצים לעיין בו לפני נקיטת פעולה, כדי להבין את לוחות הזמנים, הדרישות והאפשרויות שעומדות לרשותכם.
  </p>
</div>


      

      {/* Collapsible Filters Section */}
      <div className="filters-container">
        <button onClick={toggleFilterVisibility} className="toggle-filters-button">
          {isFilterVisible ? 'הסתר סינון' : 'הצג סינון'}
        </button>

        {isFilterVisible && (
          <div className="filters-box">
            <div className="filters">
              <select
                value={settlement}
                onChange={(e) => setSettlement(e.target.value)}
                className="filter-select"
              >
                <option value="">כל הערים</option>
                {settlementOptions.map((settlement) => (
                  <option key={settlement} value={settlement}>
                    {settlement}
                  </option>
                ))}
              </select>

              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="filter-select"
              >
                <option value="">כל הסיבות</option>
                {reasonOptions.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>

              <select
                value={licenseType}
                onChange={(e) => setLicenseType(e.target.value)}
                className="filter-select"
              >
                <option value="">כל סוגי הרישיונות</option>
                {licenseTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Render card view for very small screens, table for larger screens */}
      {isVerySmallScreen ? (
        renderMobileCards()
      ) : (
        <table className="licenses-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('permitNumber')}>מספר רשיון {renderSortArrow('permitNumber')}</th>
              <th onClick={() => handleSort('licenseType')}>סוג הרשיון {renderSortArrow('licenseType')}</th>
              <th onClick={() => handleSort('address')}>כתובת {renderSortArrow('address')}</th>
              <th onClick={() => handleSort('settlement')}>עיר {renderSortArrow('settlement')}</th>
              <th onClick={() => handleSort('reasonShort')}>סיבת כריתה {renderSortArrow('reasonShort')}</th>
              <th onClick={() => handleSort('dates.licenseDate')}>תאריך פרסום {renderSortArrow('dates.licenseDate')}</th>
              <th>תאריך אחרון לערר</th>
              <th>לינק לרשיון</th>
            </tr>
          </thead>
          <tbody>
            {sortedLicenses.map((license) => (
              <tr key={license.id} onClick={() => handleRowClick(license)} className="clickable-row">
                <td>{license.permitNumber}</td>
                <td>{license.licenseType}</td>
                <td>
                  {license.address} {license.houseNumber}
                </td>
                <td>{license.settlement}</td>
                <td>{license.reasonShort}</td>
                <td>{license.dates.licenseDate}</td>
                <td className={getDeadlineClass(license.dates.lastDateToObject)}>
                   {license.dates.lastDateToObject}
                </td>

                <td>
                  <a href={license.resourceUrl} target="_blank" rel="noopener noreferrer" className='license-link'>
                    <IoMdLink size={20} color="blue" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Permit Sidebar */}
      {selectedPermit && <PermitSidebar permit={selectedPermit} onClose={handleCloseSidebar} />}

      {/* Pagination Section */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          הקודם
        </button>
        <span>
          עמוד {currentPage} מתוך {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          הבא
        </button>
      </div>
    </div>
  );
};

export default TreeCuttingPermits;