using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("SALARY_TABLE_DETAIL")]
    public class SalaryTableDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeName { get; set; }
        public string EmployeeRole { get; set; }
        public string CodeTblSalary { get; set; }
        public decimal? SalaryPrimary { get; set; }//Lương chính
        public decimal? SalaryTotal { get; set; }//Tổng thu nhập
        public decimal? WorkDay { get; set; }//Ngày công
        public decimal? SalaryGross { get; set; }//Tổng lương thực tế
        public decimal? SalaryPayInsurance { get; set; }//Lương đóng bảo hiểm
        public decimal? SalaryReceived { get; set; }//Lương thực lĩnh
        public decimal UnionFunds { get; set; }//CPCĐ
        public decimal SocialInsuranceComp { get; set; }//BHXH (Công ty chi trả)
        public decimal HealthInsuranceComp { get; set; }//BHYT (Công ty chi trả)
        public decimal UnemploymentInsuranceComp { get; set; }//BHTN (Công ty chi trả)
        public decimal SocialInsuranceEmp { get; set; }//BHXH (Nhân viên chi trả)
        public decimal HealthInsuranceEmp { get; set; }//BHYT (Nhân viên chi trả)
        public decimal UnemploymentInsuranceEmp { get; set; }//BHTN (Nhân viên chi trả)
        public decimal? PersonalIncomeTax { get; set; }//TNCN
        public decimal? SalaryBefore { get; set; }//Tạm ứng
        public decimal? SalaryRatio { get; set; }//Tạm ứng
        public string Note { get; set; }

        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
    }

    public class SalaryTableDetailExcelModel
    {
        public string EmployeeCode { get; set; }
        public string EmployeeName { get; set; }
        public string EmployeeRole { get; set; }
        public string CodeTblSalary { get; set; }
        public decimal? SalaryPrimary { get; set; }//Lương chính
        public decimal? SalaryTotal { get; set; }//Tổng thu nhập
        public decimal? WorkDay { get; set; }//Ngày công
        public decimal? SalaryGross { get; set; }//Tổng lương thực tế
        public decimal? SalaryPayInsurance { get; set; }//Lương đóng bảo hiểm
        public decimal? SalaryReceived { get; set; }//Lương thực lĩnh
        public decimal UnionFunds { get; set; }//CPCĐ
        public decimal SocialInsuranceComp { get; set; }//BHXH (Công ty chi trả)
        public decimal HealthInsuranceComp { get; set; }//BHYT (Công ty chi trả)
        public decimal UnemploymentInsuranceComp { get; set; }//BHTN (Công ty chi trả)
        public decimal SocialInsuranceEmp { get; set; }//BHXH (Nhân viên chi trả)
        public decimal HealthInsuranceEmp { get; set; }//BHYT (Nhân viên chi trả)
        public decimal UnemploymentInsuranceEmp { get; set; }//BHTN (Nhân viên chi trả)
        public decimal? PersonalIncomeTax { get; set; }//TNCN
        public decimal? SalaryBefore { get; set; }//Tạm ứng
        public string Note { get; set; }
    }
}
