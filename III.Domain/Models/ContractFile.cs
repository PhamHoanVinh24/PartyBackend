using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("CONTRACT_FILE")]
    public class ContractFile
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ContractFileID { get; set; }

        [StringLength(100)]
        public string ContractCode { get; set; }

        [StringLength(100)]
        public string FileCode { get; set; }


        [NotMapped]
        public string RepoCode { get; set; }

        [NotMapped]
        public string FileName { get; set; }

        [NotMapped]
        public string Desc { get; set; }

        [NotMapped]
        public string NumberDocument { get; set; }

        [NotMapped]
        public string Tags { get; set; }
        [NotMapped]
        public string Url { get; set; }
    }
}
