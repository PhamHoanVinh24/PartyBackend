using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("URENCO_BRANCH_WORKING")]
    public class UrencoBranchWorking
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        public string BranchCode { get; set; }
        public string BranchName { get; set; }
        public string Description { get; set; }
        public string DataGps { get; set; }
        public string Status { get; set; }
        public string Website { get; set; }
        public string Hotline { get; set; }
        public string Email { get; set; }
        public string DirectorName { get; set; }
        public string AddressText { get; set; }
        public string AddressGps { get; set; }
        public string Rating { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime UpdatedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
    }
}
