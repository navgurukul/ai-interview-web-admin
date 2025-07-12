'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Table, Spin, Alert, Typography, Select, Row, Col, Input } from 'antd'; // Using Ant Design components for consistency

const { Title } = Typography;
const { Option } = Select;

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
  Select_School1?: string | null; // Added for the school name
  Qualification?: string | null;
  Caste?: string | null;
  // Include other fields as needed, marking them as optional if they might be missing
  [key: string]: any;
}

// The API URL is now internal, pointing to our Next.js API route
const INTERNAL_API_URL = '/api/ghar-students';

const StudentDetailsSection: React.FC = () => {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampus, setSelectedCampus] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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
            Select_School1: item.Select_School1 || null,
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

        setAllStudents(studentList);
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  // Define simplified columns for Name, Email, and Campus
  const simplifiedColumns = [
    {
      title: 'Name',
      dataIndex: 'Name',
      key: 'name',
      // Render the display value from the Name object
      render: (name: StudentName) => name?.zc_display_value || 'N/A',
      sorter: (a: Student, b: Student) =>
        (a.Name?.zc_display_value || '').localeCompare(b.Name?.zc_display_value || ''),
    },
    {
      title: 'Email',
      dataIndex: 'Navgurukul_Email',
      key: 'email',
      render: (email: string | null) => email || 'N/A',
      sorter: (a: Student, b: Student) =>
        (a.Navgurukul_Email || '').localeCompare(b.Navgurukul_Email || ''),
    },
    {
      title: 'Campus',
      dataIndex: 'Select_Campus',
      key: 'campus',
      // Render the Campus_Name from the Select_Campus object
      render: (campus: SelectCampus) => campus?.Campus_Name || 'N/A',
      sorter: (a: Student, b: Student) =>
        (a.Select_Campus?.Campus_Name || '').localeCompare(b.Select_Campus?.Campus_Name || ''),
    },
    {
      title: 'School',
      dataIndex: 'Select_School1',
      key: 'school',
      render: (school: string | null) => school || 'N/A',
      sorter: (a: Student, b: Student) =>
        (a.Select_School1 || '').localeCompare(b.Select_School1 || ''),
    },
  ];


  const campusOptions = useMemo(() => {
    const campuses = new Set(allStudents.map(student => student.Select_Campus?.Campus_Name).filter(Boolean));
    return Array.from(campuses).sort();
  }, [allStudents]);

  const schoolOptions = useMemo(() => {
    const schools = new Set(allStudents.map(student => student.Select_School1).filter(Boolean));
    return Array.from(schools).sort();
  }, [allStudents]);

  const filteredStudents = useMemo(() => {
    return allStudents.filter(student => {
      const campusMatch = !selectedCampus || student.Select_Campus?.Campus_Name === selectedCampus;
      const schoolMatch = !selectedSchool || student.Select_School1 === selectedSchool;
      return campusMatch && schoolMatch;
    });
  }, [allStudents, selectedCampus, selectedSchool]);

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  if (loading) {
    return <Spin tip="Loading student details..." size="large"><div style={{ padding: 50, background: 'rgba(0, 0, 0, 0.05)', borderRadius: 4 }} /></Spin>;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Student Details from Ghar</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col>
          <Select
            allowClear
            style={{ width: 200 }}
            placeholder="Filter by Campus"
            onChange={(value) => setSelectedCampus(value)}
            value={selectedCampus}
          >
            {campusOptions.map(campus => (
              <Option key={campus} value={campus}>{campus}</Option>
            ))}
          </Select>
        </Col>
        <Col>
          <Select
            allowClear
            style={{ width: 200 }}
            placeholder="Filter by School"
            onChange={(value) => setSelectedSchool(value)}
            value={selectedSchool}
          >
            {schoolOptions.map(school => (
              <Option key={school} value={school}>{school}</Option>
            ))}
          </Select>
        </Col>
      </Row>
      <Table
        dataSource={paginatedStudents}
        columns={simplifiedColumns}
        rowKey="ID" // Use the actual unique ID from the data
        bordered
        size="small"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredStudents.length,
          showSizeChanger: false,
          onChange: (page) => setCurrentPage(page),
        }}
        scroll={{ x: 'max-content' }}
      />
      {filteredStudents.length === 0 && !loading && (
        <Alert message="No student data found for the selected filters." type="info" />
      )}
    </div>
  );
};

export default StudentDetailsSection;
