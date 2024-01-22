using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("VC_DRIVER")]
    public class VcDriver
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(maximumLength: 50)]
        public string Id_Fb { get; set; }

        [StringLength(maximumLength: 50)]
        public string Company_Code { get; set; }

        [StringLength(maximumLength: 150)]
        public string Name { get; set; }

        [StringLength(maximumLength: 50)]
        public string Username { get; set; }

        [StringLength(maximumLength: 50)]
        public string Password { get; set; }

        [StringLength(maximumLength: 50)]
        public string Email { get; set; }

        [StringLength(maximumLength: 15)]
        public string Phone { get; set; }

        [StringLength(maximumLength: 255)]
        public string Profile_Picture { get; set; }      

        public double? Balance_Credit { get; set; }

        public int? Active { get; set; }

        public int? Type_Driver { get; set; }
        [StringLength(maximumLength: 50)]
        public string License_plate { get; set; }
        [StringLength(maximumLength: 255)]
        public string Taxy_type { get; set; }

        public int? is_Online { get; set; }

        public int? Is_busy { get; set; }

        public int? Type { get; set; }

        [StringLength(maximumLength: 50)]
        public string type_car_year { get; set; }

        [StringLength(maximumLength: 255)]
        public string Identification { get; set; }
        [StringLength(maximumLength: 255)]
        public string License_car_image { get; set; }
        [StringLength(maximumLength: 255)]
        public string Image_car { get; set; }
        [StringLength(maximumLength: 255)]
        public DateTime? CreatedDate { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }

        public int? UpdatedBy { get; set; }
        [StringLength(maximumLength: 100)]

        public string emei { get; set; }
        [StringLength(maximumLength: 500)]
        public string Description { get; set; }
        [StringLength(maximumLength: 255)]
        public string Brand { get; set; }
        [StringLength(maximumLength: 2000)]
        public string virual_intiary { get; set; }
        [StringLength(maximumLength:4000)]
        public string Polyline { get; set; }
        [StringLength(maximumLength: 255)]
        public string Start_name { get; set; }
        [StringLength(maximumLength: 255)]
        public string End_name { get; set; }
        [StringLength(maximumLength: 255)]
        public string Start_Name_GPS { get; set; }
        [StringLength(maximumLength: 255)]
        public string End_Name_GPS { get; set; }
        [StringLength(maximumLength: 1000)]
        public string Position_gps { get; set; }
        [StringLength(maximumLength: 500)]
        public string Position_text { get; set; }
        public DateTime? Position_time { get; set; }
        //public string Type { get; set; }
        public string Current_Channel { get; set; }
        public string remooc_code { get; set; }
        public string tractor_code { get; set; }
        public string Area { get; set; }
        public string SId { get; set; }

    }
}