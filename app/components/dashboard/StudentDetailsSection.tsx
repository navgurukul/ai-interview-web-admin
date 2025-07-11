'use client';

import React, { useEffect, useState } from 'react';
import { Table, Spin, Alert, Typography } from 'antd'; // Using Ant Design components for consistency

const { Title } = Typography;

interface StudentName {
  prefix: string;
  last_name: string;
  suffix: string;
  first_name: string;
  zc_display_value: string;
}

interface SelectCampus {
  Campus_Name: string;
  ID: string;
  zc_display_value: string;
}

// Updated Student interface based on the provided JSON structure
interface Student {
  ID: string; // Primary unique identifier
  Name: StudentName; // Will be an object
  Navgurukul_Email: string | null; // Can be null or empty
  Phone_Number: string | null;
  Status: string | null;
  Joining_Date: string | null; // Consider converting to Date object if needed for sorting/formatting
  Aadhar_No?: string | null;
  Select_Campus?: SelectCampus; // This is an object
  Qualification?: string | null;
  Caste?: string | null;
  // Include other fields as needed, marking them as optional if they might be missing
  [key: string]: any;
}

// The API URL is now internal, pointing to our Next.js API route
const INTERNAL_API_URL = '/api/ghar-students';

const StudentDetailsSection: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch from the internal API route
        const response = await fetch(INTERNAL_API_URL, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        const responseData = await response.json();

        if (!response.ok) {
          const errorMessage = responseData?.message || `Failed to fetch student data: ${response.status} ${response.statusText}`;
          console.error('API Error Data:', responseData);
          throw new Error(errorMessage);
        }

        console.log('Raw API Data (from internal route):', responseData);

        let studentList: Student[] = [];
        // Expecting data under the "Data" key as per the provided JSON
        if (responseData && Array.isArray(responseData.Data)) {
          studentList = responseData.Data.map((item: any): Student => ({
            // Explicitly map fields to the Student interface
            ID: item.ID || `temp-id-${Math.random()}`, // Ensure ID is always present
            Name: item.Name || { prefix: "", last_name: "N/A", suffix: "", first_name: "N/A", zc_display_value: 'N/A' },
            Navgurukul_Email: item.Navgurukul_Email || null,
            Phone_Number: item.Phone_Number || null,
            Status: item.Status || null,
            Joining_Date: item.Joining_Date || null,
            Aadhar_No: item.Aadhar_No || null,
            Select_Campus: item.Select_Campus || { Campus_Name: "N/A", ID: "", zc_display_value: "N/A" },
            Qualification: item.Qualification || null,
            Caste: item.Caste || null,
            // Spread remaining item properties
            ...item,
          }));
        } else if (responseData && Array.isArray(responseData.students)) { // Fallback if the key was 'students'
            studentList = responseData.students.map((item: any): Student => ({
              ID: item.ID || `temp-id-${Math.random()}`,
              Name: item.Name || { prefix: "", last_name: "N/A", suffix: "", first_name: "N/A", zc_display_value: 'N/A' },
              Navgurukul_Email: item.Navgurukul_Email || null,
              Phone_Number: item.Phone_Number || null,
              Status: item.Status || null,
              Joining_Date: item.Joining_Date || null,
              ...item,
            }));
        } else if (Array.isArray(responseData)) { // Fallback if data is a direct array
            studentList = responseData.map((item: any): Student => ({
                ID: item.ID || `temp-id-${Math.random()}`,
                Name: item.Name || { prefix: "", last_name: "N/A", suffix: "", first_name: "N/A", zc_display_value: 'N/A' },
                Navgurukul_Email: item.Navgurukul_Email || null,
                Phone_Number: item.Phone_Number || null,
                Status: item.Status || null,
                Joining_Date: item.Joining_Date || null,
                ...item,
            }));
        }
        else {
          console.error('Fetched data.Data is not an array or is missing, and no fallback matched:', responseData);
          setError(responseData?.message || 'Fetched data is not in the expected array format.');
        }
        setStudents(studentList);
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  // Define columns for the Ant Design Table
  // These should be dynamically generated or adjusted based on the keys in the student data
  // For now, let's assume some common fields.
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Student, b: Student) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a: Student, b: Student) => (a.email || '').localeCompare(b.email || ''),
    },
    // Add more columns as needed based on the actual data you want to display
    // Example:
    // {
    //   title: 'Zoho ID',
    //   dataIndex: 'Zoho_ID', // Ensure this key exists in your transformed student objects
    //   key: 'Zoho_ID',
    // },
    // {
    //   title: 'Mobile',
    //   dataIndex: 'Mobile',
    //   key: 'Mobile',
    // }
  ];

  // Dynamically create columns from the first student object's keys if students array is not empty
  // This is a more robust way to handle varying API responses.
  const dynamicColumns = students.length > 0
    ? Object.keys(students[0])
        .filter(key => key !== 'id' && key !== '_id') // Exclude 'id' or other internal keys if needed
        .map(key => ({
          title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Format title
          dataIndex: key,
          key: key,
          sorter: (a: Student, b: Student) => {
            const valA = a[key] !== null && a[key] !== undefined ? String(a[key]) : '';
            const valB = b[key] !== null && b[key] !== undefined ? String(b[key]) : '';
            return valA.localeCompare(valB);
          },
        }))
    : columns; // Fallback to predefined columns if no data or for initial render


  if (loading) {
    return <Spin tip="Loading student details..." size="large"><div style={{ padding: 50, background: 'rgba(0, 0, 0, 0.05)', borderRadius: 4 }} /></Spin>;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Student Details from Ghar</Title>
      <Table
        dataSource={students}
        columns={dynamicColumns}
        rowKey="id" // Ensure 'id' is unique and present for each student
        bordered
        size="small"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }} // For horizontal scrolling if many columns
      />
      {students.length === 0 && !loading && <Alert message="No student data found." type="info" />}
    </div>
  );
};

export default StudentDetailsSection;
