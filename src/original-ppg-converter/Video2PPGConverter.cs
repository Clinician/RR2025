using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading;

namespace CamPPG
{
    public class Video2PPGConverter
    {
        public int Im_Width;
        public int Im_Height;
        public int Phone;

        public struct PpgStruct
        {
            public ulong timestamp;
            public double[] Signals;
            public bool QualityWarning;
        };
        /// <summary>
        /// Constructor used for <c>Video2PPGConverter</c> class.
        /// </summary> 
        public Video2PPGConverter()
        {
        }

        /// <summary>
        /// Initializes the algorithm. It must be called before the iteration function.
        /// </summary>
        public void InitAlgo(int width, int height, int PhoneModel)
        {
            Im_Width = width;
            Im_Height = height;
            Phone = PhoneModel;
        }

        /// <summary>
        /// Method that transforms the image to a pseudo-PPG signals. Used for iOS where U and V channel are mixed together.
        /// </summary>
        /// <param name="Timestamp">Timestamp when the image was acqired (in ms).</param>
        /// <param name="Y">Y pixel array (width*height).</param>
        /// <param name="UV">UV pixel values ((bufferlength - width*height)).</param>
        /// <param name="width">Width of the image, in pixels.</param>
        /// <param name="height">Height of the image, in pixels.</param>
        /// <returns>PPG-like signals and Quality Index</returns>
        //public void ConvertFrame2PPG(ulong Timestamp, byte[] Y, byte[] U, byte[] V, out PpgStruct output)
        public void ConvertFrame2PPGiOS(ulong Timestamp, byte[] Y, byte[] UV, out PpgStruct output)
        {
            //Define number of ROI by row and column
            int n_ROIs = 3;

            //ExtractFeatures(Y, U, V, n_ROIs,n_ROIs, Im_Width, Im_Height, Phone, out double[] PpgValues, out bool QualityWarning);
            ExtractFeaturesiOS(Y, n_ROIs, n_ROIs, Im_Width, Im_Height, Phone, out double[] PpgValues, out bool QualityWarning);

            output = new PpgStruct
            {
                timestamp = Timestamp,
                Signals = PpgValues,
                QualityWarning = QualityWarning,
            };
        }

        /// <summary>
        /// Method that transforms the image to a pseudo-PPG signals. Used for iOS where U and V channel are separated.
        /// </summary>
        /// <param name="Timestamp">Timestamp when the image was acqired (in ms).</param>
        /// <param name="Y">Y pixel array (width*height).</param>
        /// <param name="U">U pixel values ((bufferlength - width*height) / 2).</param>
        /// <param name="V">V pixel values ((bufferlength - width*height) / 2).</param>
        /// <param name="width">Width of the image, in pixels.</param>
        /// <param name="height">Height of the image, in pixels.</param>
        /// <returns>PPG-like signals and Quality Index</returns>
        public void ConvertFrame2PPGAndroid(ulong Timestamp, byte[] Y, byte[] U, byte[] V, out PpgStruct output)
        {
            //Define number of ROI by row and column
            int n_ROIs = 3;

            //ExtractFeatures(Y, U, V, n_ROIs,n_ROIs, Im_Width, Im_Height, Phone, out double[] PpgValues, out bool QualityWarning);
            ExtractFeaturesAndroid(Y, U, V, n_ROIs, n_ROIs, Im_Width, Im_Height, Phone, out double[] PpgValues, out bool QualityWarning);

            output = new PpgStruct
            {
                timestamp = Timestamp,
                Signals = PpgValues,
                QualityWarning = QualityWarning,
            };
        }

        //public void ExtractFeatures(byte[] Y, byte[] U, byte[] V, int n_ROIsbyRow, int n_ROIsbyCols, int width, int height, int PhoneModel, out double[] PpgValues, out bool QualityWarning)
        public void ExtractFeaturesiOS(byte[] Y, int n_ROIsbyRow, int n_ROIsbyCols, int width, int height, int PhoneModel, out double[] PpgValues, out bool QualityWarning)
        {
            int NumPixels, xoffset, yoffset, ROIwidth, ROIheight, rest;
            int xby2, yby2;
            double maxY, minY;
            double ROImeanY;

            int n_ROIs = n_ROIsbyCols * n_ROIsbyRow;
           
            int sizeY = width * height;
            int wstep = width / n_ROIsbyRow;
            int hstep = height / n_ROIsbyCols;
            int row = 1;
            maxY = 0; minY = 100000;
            rest = 0;

            ROImeanY = 0;
            PpgValues = new double[3*n_ROIs+3];

            for (int r = 0; r < n_ROIs; r++)
            {
                NumPixels = 0;
                ROImeanY = 0;

                xoffset = (r * wstep + rest) % width;
                yoffset = ((r * wstep + rest) / width) * hstep;

                if (((r + 2) * (float)wstep / width) > row)
                {
                    ROIwidth = width - xoffset;
                    rest += row * width - ((r + 1) * wstep + rest);
                    row++;
                }
                else
                    ROIwidth = wstep;

                if ((((r + 2) * (float)wstep / width) * hstep / height) > 1)
                    ROIheight = height - yoffset;
                else
                    ROIheight = hstep;

                for (int i = xoffset; i < xoffset + ROIwidth; i++)
                {
                    for (int j = yoffset; j < yoffset + ROIheight; j++)
                    {
                        xby2 = i / 2;
                        yby2 = j / 2;
                        double Yval = Y[i + j * width] & 0xff;
                        ROImeanY += Yval;
                        NumPixels++; 
                    }
                }

                PpgValues[3 * r] = ROImeanY / NumPixels;

                //Get max and min Mean luminance between ROIs
                if (PpgValues[3 * r] > maxY)
                    maxY = PpgValues[3 * r];
                if (PpgValues[3 * r] < minY)
                    minY = PpgValues[3 * r];
            }

            //Check luminance variance and min/max between ROIs
            double  MaxIntensity, MinIntensity;//Intensities observed from 60fps tests in January 2019
            MaxIntensity = 1100;
            MinIntensity = 400;

            if (maxY < MaxIntensity & minY > MinIntensity)
                QualityWarning = false;
            else
                QualityWarning = true;

            QualityWarning = false;
        }

        public void ExtractFeaturesAndroid(byte[] Y, byte[] U, byte[] V, int n_ROIsbyRow, int n_ROIsbyCols, int width, int height, int PhoneModel, out double[] PpgValues, out bool QualityWarning)
        {
            int NumPixels, xoffset, yoffset, ROIwidth, ROIheight, rest;
            int xby2, yby2;
            double maxY, minY;
            double ROImeanY, ROImeanU, ROImeanV;
            double smsqY;

            int n_ROIs = n_ROIsbyCols * n_ROIsbyRow;

            int sizeY = width * height;
            int wstep = width / n_ROIsbyRow;
            int hstep = height / n_ROIsbyCols;
            int row = 1;
            rest = 0;

            ROImeanY = 0; ROImeanU = 0; ROImeanV = 0;
            maxY = 0;minY = 100000;
            smsqY = 0;
            double varY = 0;

            PpgValues = new double[3 * n_ROIs + 3];

            for (int r = 0; r < n_ROIs; r++)
            {
                NumPixels = 0;
                ROImeanY = 0; ROImeanU = 0; ROImeanV = 0;
                smsqY = 0;

                xoffset = (r * wstep + rest) % width;
                yoffset = ((r * wstep + rest) / width) * hstep;

                if (((r + 2) * (float)wstep / width) > row)
                {
                    ROIwidth = width - xoffset;
                    rest += row * width - ((r + 1) * wstep + rest);
                    row++;
                }
                else
                    ROIwidth = wstep;

                if ((((r + 2) * (float)wstep / width) * hstep / height) > 1)
                    ROIheight = height - yoffset;
                else
                    ROIheight = hstep;

                for (int i = xoffset; i < xoffset + ROIwidth; i++)
                {
                    for (int j = yoffset; j < yoffset + ROIheight; j++)
                    {
                        xby2 = i / 2;
                        yby2 = j / 2;

                        //int Yval = yuv[i + j * width] & 0xff;
                        //int Uval = yuv[sizeY + 2 * xby2 + yby2 * width] & 0xff;
                        //int Vval = yuv[sizeY + 2 * xby2 + yby2 * width + 1] & 0xff;

                        double Yval = Y[i + j * width] & 0xff;
                        int Uval, Vval;
                        if (2 * xby2 + yby2 * width < U.Length)
                            Uval = U[2 * xby2 + yby2 * width] & 0xff;
                        else
                            Uval = V[2 * xby2 + yby2 * width - U.Length] & 0xff;
                        if (2 * xby2 + yby2 * width + 1 < U.Length)
                            Vval = U[2 * xby2 + yby2 * width + 1] & 0xff;
                        else
                            Vval = V[2 * xby2 + yby2 * width + 1 - U.Length] & 0xff;

                        ROImeanY += Yval;
                        ROImeanU += Uval;
                        ROImeanV += Vval;

                        smsqY += Uval * Uval;

                        NumPixels++;
                    }
                }

                PpgValues[3 * r] = ROImeanY / NumPixels;
                PpgValues[3 * r + 1] = ROImeanU / NumPixels;
                PpgValues[3 * r + 2] = ROImeanV / NumPixels;

                //Get variance and max and min Mean luminance between ROIs
                double tmpY = Math.Sqrt(smsqY / NumPixels - ROImeanU / NumPixels * ROImeanU / NumPixels);
                if (tmpY > varY)
                    varY = tmpY;
                if (PpgValues[3 * r+1] > maxY)
                    maxY = PpgValues[3 * r + 1];
                if (PpgValues[3 * r+1] < minY)
                    minY = PpgValues[3 * r + 1];
            }

            //Check luminance variance and min/max between ROIs
            double MaxVar, MaxIntensity, MinIntensity;
            MaxVar = 10;
            MaxIntensity = 150;
            MinIntensity = 10;

            if (varY < MaxVar & maxY < MaxIntensity & minY > MinIntensity)
                QualityWarning = false;
            else
                QualityWarning = true;
            QualityWarning = false;
        }
    }
}
