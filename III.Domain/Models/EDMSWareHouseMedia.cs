using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("EDMS_WAREHOUSE_MEDIA")]
    public class EDMSWareHouseMedia
    { 
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string WHS_Code { get; set; }

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
