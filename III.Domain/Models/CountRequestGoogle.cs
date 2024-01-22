using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("COUNT_REQUEST_GOOGLE")]
    public class CountRequestGoogle
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public DateTime Create_time { get; set; }

        public string Date { get; set;}

        public int Is_limit { get; set; }

        public string Key { get; set; }

        public int Num_request { get; set; }

        [StringLength(50)]
        public string Service_type { get; set; }

        public DateTime Update_time { get; set; }

        [StringLength(255)]
        public string device { get; set; }

    }
}
