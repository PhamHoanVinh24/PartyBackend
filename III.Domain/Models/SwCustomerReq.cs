using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace III.Domain.Models
{
    [Table("SW_CUSTOMER_REQ")]
    public class SwCustomerReq
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [StringLength(255)]
        public string CompanyName { get; set; }

        [StringLength(10)]
        public string Tel { get; set; }

        [StringLength(255)]
        public string Email { get; set; }

        [StringLength(255)]
        public string Logo { get; set; }

        [StringLength(255)]
        public string Slogan { get; set; }

        [StringLength(255)]
        public string Domain { get; set; }

        [StringLength(255)]
        public string Noted { get; set; }

        [StringLength(255)]
        public string MonthTried { get; set; }

        [StringLength(255)]
        public string Background { get; set; }

        [StringLength(255)]
        public string ReqCode { get; set; }

        [StringLength(500)]
        public string requestTitle { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(255)]
        public string CreatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(255)]
        public string UpdatedBy { get; set; }

        [StringLength(255)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }

    }
}
